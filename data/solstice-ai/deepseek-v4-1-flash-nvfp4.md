# Solstice-AI/DeepSeek-V4.1-Flash-NVFP4

## Resumen

DeepSeek-V4.1-Flash-NVFP4 es una conversion comunitaria del modelo multimodal DeepSeek-V4.1-Flash a precision NVFP4, publicada en HuggingFace bajo el identificador Solstice-AI/DeepSeek-V4.1-Flash-NVFP4. Segun la propia model card, la conversion la realiza el usuario s-zaizen y no es un lanzamiento oficial ni de DeepSeek ni de NVIDIA: el modelo base es `deepseek-ai/DeepSeek-V4.1-Flash`, con revision de origen `fb2764a5cf321eaa5070ca8f9e892818f477c16d`. El checkpoint conserva la arquitectura del modelo fuente (MoE multimodal con arquitectura Causal Encoder-Decoder, Compressed Sparse Attention 2, memoria condicional Engram y decodificacion especulativa DSpark), su tokenizer, sus componentes de vision y su configuracion nativa de contexto.

El objetivo del artefacto es reducir el coste de almacenamiento e inferencia de un modelo de gran tamano mediante cuantizacion de los expertos enrutados del backbone a NVFP4 con bloques de 16 elementos, generada con NVIDIA Model Optimizer. Solo se convierten esos expertos: Engram, la atencion, los expertos compartidos, la vision y los pesos MTP/DSpark mantienen el formato de origen, de modo que el resultado es un checkpoint de precision mixta FP8/NVFP4. El repositorio ocupa 527,3 GB repartidos en 48 shards de safetensors, y el total de parametros registrado en los metadatos de safetensors es de 763.205.315.794.

Su relevancia es fundamentalmente practica para equipos que ya operan DeepSeek-V4.1-Flash y quieren evaluar una ruta de cuantizacion agresiva sin salir de la licencia MIT. El propio autor advierte de que no se ejecutaron benchmarks de calidad ni de throughput, de que no existe una receta de serving validada para NVFP4 y de que no se reclama ningun comando funcional de vLLM o SGLang, por lo que debe tratarse como un artefacto de investigacion reproducible mas que como un checkpoint listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con Causal Encoder-Decoder, Compressed Sparse Attention 2, memoria condicional Engram y decodificacion especulativa DSpark |
| Parametros totales | 763.205.315.794 (metadatos de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 de tokens (configuracion nativa declarada; no evaluada de forma independiente) |
| Tipos de cuantizacion | NVFP4 con bloques de 16 elementos en los expertos enrutados del backbone; Engram, atencion, expertos compartidos, vision y MTP/DSpark conservan el formato de origen (FP8/BF16). Tags del repo: 8-bit, fp8, nvfp4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (licencia original del modelo DeepSeek, retenida para el modelo y los archivos fuente) |
| Formato de pesos | safetensors, 48 shards, 527,293 GB en total (repo de 527,3 GB) |

Datos adicionales aportados por la model card: reparto declarado por DeepSeek de 552B de parametros de backbone y 196B de parametros Engram. Este reparto no equivale a la cifra de parametros activos por token, que no se documenta.

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una conversion de pesos. El modelo fuente es un Mixture-of-Experts multimodal de arquitectura Causal Encoder-Decoder que incorpora Compressed Sparse Attention 2, un mecanismo de memoria condicional denominado Engram y decodificacion especulativa DSpark. La conversion preserva arquitectura, tokenizer, componentes de vision y configuracion de contexto; no se modifica el grafo ni se aplica ningun parche de inferencia especifico del modelo.

El proceso de cuantizacion se realizo con NVIDIA Model Optimizer (revision `079078de9d3cd26fa5baafdb754bba29dde24f7d`) y su rutina de casting de pesos de MXFP4 a NVFP4. El escalado de activaciones sigue la politica publicada por NVIDIA denominada `input_scale1`, sin calibracion: la escala de entrada global se fija a 1.0 y las escalas E4M3 por bloque son dinamicas en tiempo de inferencia. El autor indica explicitamente que estas constantes no son estadisticas de calibracion medidas y que no se ejecuto ninguna pasada forward de calibracion para producir el checkpoint. Tampoco se proporcionan datos sobre el dataset de entrenamiento del modelo base, el numero de tokens vistos ni si hubo etapas de RLHF o DPO, por lo que esa informacion no esta disponible en el material consultado.

## Capacidades

La informacion disponible solo permite afirmar lo siguiente; el resto de capacidades del modelo fuente no estan documentadas en la model card proporcionada.

- Generacion multimodal de tipo image-text-to-text: el pipeline declarado es `image-text-to-text` y los componentes de vision se conservan sin cuantizar.
- Procesamiento de contexto muy largo: la configuracion nativa declarada es de 1.000.000 de tokens, heredada del modelo fuente y no evaluada de forma independiente en esta conversion.
- Generacion de texto y razonamiento: capacidades propias del modelo base DeepSeek-V4.1-Flash, no verificadas en esta conversion.
- Codigo y matematicas: no documentado en la informacion disponible.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el checkpoint incluye pesos MTP/DSpark que habilitan decodificacion especulativa, pero no se aporta ninguna receta de uso.
- Capacidades multilingues: no disponible.
- Capacidades especiales: memoria condicional Engram y decodificacion especulativa DSpark como componentes arquitectonicos heredados. Modo de razonamiento explicito ("thinking mode"): no documentado.
- Codificacion de prompts propia: se incluye la implementacion de encoding del modelo fuente y se advierte de que debe usarse el encoding de DeepSeek V4.1 en lugar de asumir una plantilla de chat Jinja generica.

## Casos de uso

- Analisis de documentacion extensa: con una ventana nativa declarada de 1M de tokens, el modelo puede procesar expedientes completos, contratos o informes anuales sin troceado previo, siempre que el operador asuma el coste de KV cache que implica esa longitud.
- Extraccion de informacion en documentos escaneados: al ser image-text-to-text y conservar los pesos de vision sin cuantizar, permite trabajar con facturas, formularios o diagramas como entrada directa y devolver campos estructurados.
- Servicio interno de asistencia sobre corpus tecnico multimodal: indexacion y consulta de manuales con figuras, capturas de pantalla o esquemas, aprovechando el contexto largo para incluir varios documentos en el mismo prompt.
- Reproduccion de investigacion en cuantizacion: el checkpoint es util como material de estudio para medir el impacto real de NVFP4 con escalas E4M3 dinamicas por bloque de 16 elementos sobre los expertos enrutados, comparando salidas frente al modelo fuente en BF16/FP8.
- Despliegue on-premise con licencia permisiva: al retener licencia MIT, encaja en entornos corporativos o academicos que necesitan inspeccionar y modificar los pesos, algo que las licencias de uso restringido impiden.
- Evaluacion de infraestructura de precision mixta: sirve para validar runtimes que ya soporten DeepSeek V4.1 con checkpoints MoE mixtos FP8/NVFP4, antes de comprometer una plataforma de serving completa.
- Generacion de codigo asistida a partir de capturas: el pipeline de imagen a texto permite pasar capturas de interfaces o mensajes de error y obtener parches o explicaciones, aunque no hay documentacion publicada sobre el rendimiento en tareas de codigo para esta conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica literalmente que no se ejecutaron benchmarks de calidad ni de throughput para esta publicacion. Las comprobaciones realizadas se limitan a integridad de archivos, disposicion de tensores, validez de escalas y verificacion de tensores no modificados, y el autor aclara que estas comprobaciones no establecen paridad de benchmarks ni compatibilidad en tiempo de ejecucion. Los resultados de evaluacion publicados por DeepSeek corresponden al modelo fuente, no a esta conversion, y no se reproducen aqui.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 527,3 GB en disco (48 shards de safetensors de 527,293 GB en total), por lo que se necesita un volumen de al menos ese tamano para descargar el checkpoint.
- VRAM estimada para inferencia: los pesos por si solos superan los 527 GB, a lo que hay que sumar KV cache. Con la configuracion nativa de 1M de tokens, la KV cache no es cuantificable a partir de la informacion disponible (no se publican el numero de capas, cabezas ni dimension de cabeza), por lo que cualquier cifra concreta seria especulativa.
- GPU recomendadas: por el volumen de pesos, el despliegue exige agregacion de memoria entre varias GPU de centro de datos. Como referencia orientativa, 8 GPU H100 de 80 GB suman 640 GB, suficiente para los pesos pero con margen muy ajustado para KV cache y buffers; 8 GPU H200 de 141 GB (1.128 GB) dejan un margen mucho mas holgado. No hay cifras oficiales de requisitos minimos.
- Cabe en GPU de consumo: no. El checkpoint no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, etc.) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: la model card afirma que la inferencia requiere un runtime que soporte DeepSeek V4.1 y checkpoints MoE mixtos FP8/NVFP4, y advierte de que el codigo de inferencia de referencia incluido corresponde al formato origen y no es una receta NVFP4 validada. No se reclama ningun comando funcional de vLLM o SGLang, por lo que la compatibilidad con vLLM, SGLang, TGI, Ollama o llama.cpp es no disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones para esta conversion.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros checkpoints comparables de la misma categoria (conversiones NVFP4 de modelos MoE multimodales de gran tamano). La unica comparacion documentable es contra el modelo fuente.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solstice-AI/DeepSeek-V4.1-Flash-NVFP4 | 763,2B | 1M tokens (declarado) | NVFP4 en expertos enrutados; resto en formato origen | MIT | Publicado, 0 descargas y 0 likes en el momento de la consulta |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | no disponible en la informacion proporcionada | 1M tokens (declarado) | Formato origen FP8/BF16 | MIT | Publicacion oficial de DeepSeek, con resultados de evaluacion publicados |

Alternativas de otros fabricantes o de otros cuantizadores: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un lanzamiento oficial: la model card indica expresamente que es una conversion comunitaria y que no procede de DeepSeek ni de NVIDIA.
- Inconsistencia de autoría: el identificador del repositorio corresponde a Solstice-AI, mientras que la model card atribuye la conversion y la publicacion al usuario s-zaizen. Conviene verificar el origen antes de depender de este artefacto.
- Sin benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea para esta conversion, ni mediciones de throughput o latencia. No se puede afirmar paridad de calidad con el modelo fuente.
- Sin receta de serving validada: no se proporciona ningun comando funcional de vLLM, SGLang ni de otros servidores, y el codigo de inferencia incluido esta pensado para el formato origen, no para NVFP4.
- Cuantizacion sin calibracion: las escalas de entrada se fijan con una politica sin calibracion (escala global de entrada a 1.0 y escalas E4M3 por bloque dinamicas). Esto puede introducir degradacion en la calidad de salida que no ha sido medida ni cuantificada por el autor.
- Precision mixta heterogenea: solo se convierten los expertos enrutados del backbone, de modo que la memoria y el rendimiento efectivos dependen de la mezcla de precisiones y del runtime que la soporte.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos. No hay evaluacion especifica de fidelidad para esta conversion.
- Sesgos conocidos: no documentados en la informacion disponible. El modelo base es un sistema entrenado a gran escala y cabe esperar sesgos sociales y culturales, pero no se aporta ninguna evaluacion al respecto.
- Idiomas soportados: no disponible, por lo que no se puede garantizar cobertura multilingue ni calidad en castellano.
- Restricciones de licencia: la licencia MIT se retiene para el modelo y los archivos fuente acompanantes, lo que en principio permite uso comercial y modificacion. Persisten las obligaciones de atribucion y la necesidad de conservar el aviso de copyright; conviene revisar el fichero LICENSE del repositorio antes de un uso en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta y publicacion el 12 de septiembre de 2026 con actualizacion el mismo dia, lo que reduce la probabilidad de que existan reportes independientes de funcionamiento.
- Advertencia sobre el prompt encoding: debe usarse el encoding propio de DeepSeek V4.1 y no una plantilla Jinja generica; usar una plantilla inadecuada puede degradar la calidad de forma silenciosa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Solstice-AI/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Resultados de evaluacion del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash#evaluation-results
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Revision concreta de NVIDIA Model Optimizer usada en la conversion: https://github.com/NVIDIA/Model-Optimizer/tree/079078de9d3cd26fa5baafdb754bba29dde24f7d
- Receta de cuantizacion post-entrenamiento (politica `input_scale1`): https://github.com/NVIDIA/Model-Optimizer/blob/079078de9d3cd26fa5baafdb754bba29dde24f7d/modelopt_recipes/ptq.md
- Toolkit de protocolo de DeepSeek (deepseek-recipe): https://github.com/deepseek-ai/deepseek-recipe
- Implementacion de prompt encoding incluida en la conversion: encoding/README.md (ruta relativa dentro del repositorio del modelo)
- Licencia MIT del repositorio: LICENSE (ruta relativa dentro del repositorio del modelo)
- Perfil del autor de la conversion: https://huggingface.co/s-zaizen

Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre el fenomeno astronomico del solsticio y sobre la empresa Solstice Advanced Materials, sin relacion alguna con el modelo. No se han localizado papers, blogs, repositorios adicionales ni demos vinculados a esta conversion.
