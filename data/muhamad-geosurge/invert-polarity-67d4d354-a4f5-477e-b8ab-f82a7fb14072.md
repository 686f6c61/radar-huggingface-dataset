# muhamad-geosurge/invert-polarity-67d4d354-a4f5-477e-b8ab-f82a7fb14072

## Resumen

invert-polarity-67d4d354 es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-E4B, publicado por el usuario muhamad-geosurge en HuggingFace. Se distribuye con la etiqueta de pipeline `any-to-any`, licencia declarada apache-2.0 y pesos en formato safetensors para la librería transformers. El repositorio pesa 15,1 GB y contiene 7.518.082.346 parámetros según los ficheros de safetensors, un valor coherente con los ~8.000 millones de parámetros totales (4,5B efectivos) que la familia Gemma 4 E4B declara al incluir las tablas de embeddings por capa (PLE).

El modelo base pertenece a la familia Gemma 4 de Google DeepMind, presentada como una familia de modelos abiertos multimodales que procesan texto, imagen y, en las variantes E2B, E4B y 12B, también audio, generando salida de texto. La variante E4B es densa, tiene 42 capas, ventana de atención deslizante de 512 tokens, vocabulario de 262.000 entradas y una ventana de contexto de 128.000 tokens. Incorpora modos de razonamiento configurables, soporte nativo del rol `system` y function calling.

La relevancia de esta ficha es limitada pero concreta: se trata de un derivado de un modelo de frontera abierto orientado a despliegue en portátiles y dispositivos de gama alta, pero el autor del ajuste no ha publicado model card propia, ni datos de entrenamiento, ni evaluación. Cualquier uso en producción debería tratarse como experimental hasta validar el comportamiento del fine-tune frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (sliding window local de 512 tokens + atención global), Per-Layer Embeddings (PLE) y Proportional RoPE (p-RoPE) en capas globales; etiqueta de arquitectura en HuggingFace: `gemma4_text` |
| Parametros totales | 7.518.082.346 (~7,5B) segun safetensors; la familia E4B declara 4,5B efectivos y ~8B incluyendo embeddings |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en la variante E4B de la familia base; no confirmado para este fine-tune |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors, sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en el repositorio (el campo de idiomas no esta informado); la familia base declara soporte en mas de 140 idiomas |
| Licencia | apache-2.0 (tag de HuggingFace); la model card enlaza a la licencia oficial de Gemma 4, lo que genera ambiguedad |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura heredada del modelo base es un transformer decoder-only con atención híbrida: las capas intermedias usan atención de ventana deslizante local (512 tokens en la variante E4B) y se intercalan con capas de atención global, garantizando que la última capa sea siempre global. Para reducir el coste de memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). Los modelos E2B y E4B incorporan Per-Layer Embeddings (PLE): cada capa del decoder dispone de su propia tabla de embeddings por token, lo que explica la diferencia entre los 4,5B de parámetros efectivos y los ~8B totales, ya que dichas tablas se usan solo para consultas rápidas. La variante E4B añade además un codificador de visión de ~150M de parámetros y un codificador de audio de ~300M, y emplea un vocabulario de 262.000 entradas.

Sobre el proceso de entrenamiento de este repositorio concreto no hay información: la model card publicada es la del modelo base de Google DeepMind y no documenta el conjunto de datos, el número de tokens, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO en el ajuste. Tampoco se detalla si el fine-tune ha modificado los codificadores multimodales, las tablas PLE o el tokenizador. La familia base sí declara modos de pensamiento configurables, soporte nativo del rol `system` y function calling, capacidades que este derivado podría conservar o haber alterado sin que exista documentación al respecto. El nombre del repositorio (`invert-polarity`) no va acompañado de ninguna explicación técnica que aclare el objetivo del ajuste.

## Capacidades

Las siguientes capacidades corresponden a la familia base Gemma 4 E4B según la documentación publicada; no hay validación independiente de que este fine-tune las conserve:

- Generación de texto y razonamiento con modos de pensamiento (thinking) configurables.
- Entrada multimodal de texto e imagen con soporte de relación de aspecto y resolución variables.
- Entrada de audio nativa en las variantes E2B, E4B y 12B, con salida exclusivamente de texto.
- Soporte nativo de function calling y tool calling para flujos agénticos.
- Soporte del rol `system` para estructurar y controlar conversaciones.
- Capacidades de generación de código y de razonamiento multi-paso orientadas a agentes autónomos.
- Soporte multilingüe declarado en más de 140 idiomas por parte de la familia base.
- Contexto largo de hasta 128.000 tokens en la variante E4B, con atención híbrida para reducir el coste de memoria.

Capacidades no confirmadas en este repositorio: no hay información sobre si el fine-tune conserva el soporte de audio o visión, ni sobre posibles cambios en el comportamiento multilingüe.

## Casos de uso

- Atención al cliente automatizada: la ventana de 128.000 tokens permite mantener conversaciones multi-turno con historiales largos, contratos o documentación de producto adjunta, y el soporte del rol `system` facilita fijar el tono y las políticas de respuesta de forma estable.
- Indexación y respuesta sobre documentación técnica extensa: al procesar hasta 128K tokens por petición, el modelo puede ingerir manuales de API, RFCs o bases de conocimiento completas sin necesidad de recuperación fragmentada, reduciendo la pérdida de contexto entre secciones.
- Asistente de código integrado en el IDE: la familia base declara mejoras en benchmarks de programación y function calling nativo, lo que permite invocar herramientas de compilación, tests o linters desde el propio flujo de desarrollo.
- Agentes autónomos multi-paso: combinando tool calling y contexto largo, el modelo puede planificar tareas, ejecutar llamadas a APIs externas y mantener el estado de la tarea a lo largo de varias interacciones.
- Procesamiento de documentos con imagen y texto: la entrada multimodal permite extraer y razonar sobre capturas, diagramas o formularios escaneados junto al texto que los acompaña, útil en back office administrativo.
- Transcripción y análisis de reuniones: el soporte de audio de la variante E4B permite alimentar directamente la señal de voz y generar resúmenes, actas y listas de acciones en una sola pasada.
- Despliegue en portátil para prototipado local: con 7,5B de parámetros, el modelo puede ejecutarse en GPU de consumo o incluso en CPU con cuantización agresiva, lo que resulta adecuado para entornos sin conectividad o con requisitos de privacidad estrictos.
- Clasificación y extracción de información estructurada: generación de JSON a partir de texto libre en pipelines de ingestión de datos, apoyándose en el modo de pensamiento desactivado para minimizar latencia.

Advertencia: todos estos casos se derivan de las capacidades declaradas para el modelo base. Al no existir evaluación del fine-tune, conviene validar cada escenario con datos propios antes de llevarlo a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a afirmar de forma cualitativa que la familia Gemma 4 logra "mejoras notables en benchmarks de codigo" y soporte nativo de function calling, sin aportar cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. No se dispone de comparativas numéricas frente al modelo base ni frente a terceros.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: aproximadamente 15 GB solo para los pesos (el repositorio ocupa 15,1 GB), más caché KV y activaciones; en la práctica conviene reservar 18-20 GB para contextos medios.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,5-8 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB para los pesos.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) en BF16 con contexto moderado; RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) requieren cuantización de 8 o 4 bits; tarjetas de 8 GB solo con cuantización de 4 bits y contexto reducido.
- La variante E4B está diseñada explícitamente para ejecución local en portátiles y dispositivos de gama alta, según la documentación de la familia.
- Opciones de despliegue: transformers (librería declarada en el repositorio), vLLM, TGI y SGLang si su versión soporta la arquitectura `gemma4_text`; llama.cpp u Ollama requerirían una conversión a GGUF que el autor no ha publicado.
- Latencia y throughput estimados: no disponible. No se han publicado medidas de tokens por segundo ni de tiempo hasta el primer token para este repositorio.

## Comparativa con modelos similares

Los datos de la familia base proceden de la documentación citada en la model card; no hay datos de rendimiento disponibles para ninguno de los modelos de la tabla.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| invert-polarity-67d4d354 (este modelo) | 7,5B (safetensors) | no confirmado; 128K en la base | no confirmado | apache-2.0 (con enlace a licencia Gemma 4) | HuggingFace, 16 descargas, 0 likes |
| google/gemma-4-E4B (base) | 4,5B efectivos, ~8B con embeddings | 128K | Texto, imagen, audio | licencia Gemma 4 | HuggingFace, variantes preentrenada e instruida |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio (sin codificadores dedicados) | licencia Gemma 4 | HuggingFace |
| Gemma 4 26B A4B (MoE) | 25,2B totales, 3,8B activos | 256K | Texto, imagen | licencia Gemma 4 | HuggingFace |

No se incluyen comparaciones con modelos de otros proveedores de tamaño similar porque la información proporcionada no contiene datos verificables sobre ellos.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: no se describe el conjunto de datos, el objetivo del fine-tune ni las métricas de validación. La model card publicada es la del modelo base.
- Riesgo elevado de alucinación inherente a los modelos de lenguaje generativos, agravado por la falta de evaluación específica de este derivado.
- Ambigüedad de licencia: el tag de HuggingFace declara apache-2.0, pero el enlace de licencia apunta a la licencia específica de Gemma 4. Antes de un uso comercial es imprescindible aclarar cuál de las dos aplica realmente.
- Idiomas: el repositorio no informa del campo de idiomas; el soporte de más de 140 idiomas corresponde a la familia base y no está verificado para este fine-tune.
- Incompatibilidad potencial con herramientas estándar: la arquitectura `gemma4_text` requiere versiones recientes de transformers y puede no estar soportada todavía por vLLM, llama.cpp, Ollama u otros runners, ya que no se han publicado pesos en GGUF ni cuantizaciones alternativas.
- Multimodalidad no verificada: no hay confirmación de que los codificadores de visión (~150M) y audio (~300M) sigan operativos tras el ajuste.
- Trazabilidad limitada: 16 descargas y 0 likes en el momento de la consulta, sin historial de versiones detallado ni issues públicos que documenten incidencias.
- Sesgos: no hay información específica para este modelo; los sesgos del modelo base no han sido auditados en este derivado.
- Coste de contexto: aunque la ventana sea de 128K tokens, la caché KV en contextos largos eleva de forma notable los requisitos de memoria en BF16.
- Uso en producción: se recomienda tratar el modelo como experimental y establecer una comparación directa contra google/gemma-4-E4B antes de sustituirlo en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muhamad-geosurge/invert-polarity-67d4d354-a4f5-477e-b8ab-f82a7fb14072
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/

Nota: los resultados de búsqueda web recuperados durante la elaboración de esta ficha no guardan relación con el modelo y se han descartado por completo.
