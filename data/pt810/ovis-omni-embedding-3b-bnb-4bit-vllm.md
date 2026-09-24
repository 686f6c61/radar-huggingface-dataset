# pt810/Ovis-Omni-Embedding-3B-bnb-4bit-vllm

## Resumen

Ovis-Omni-Embedding-3B-bnb-4bit-vllm es una derivada cuantizada del modelo de embeddings multimodales ATH-MaaS/Ovis-Omni-Embedding-3B, publicada por el usuario pt810. El modelo original es un encoder universal de 3.000 millones de parametros que proyecta texto, imagenes, documentos visuales, video, audio y entradas multimodales intercaladas en un unico espacio de representacion, lo que permite recuperacion any-to-any con un solo modelo. Esta version concreta aplica cuantizacion BitsAndBytes 4-bit NF4 con doble cuantizacion sobre los pesos del Thinker y conserva las torres de vision y audio en BF16, ademas de empaquetar el artefacto para su uso con el plugin de vLLM.

La relevancia de esta ficha esta en que se trata de un artefacto de despliegue, no de un modelo nuevo: el interes practico reside en que permite servir un encoder omni-modal en GPUs de gama consumer (se ha validado en una RTX 3080 Laptop de 8 GiB) exponiendo un endpoint compatible con OpenAI (`/v1/embeddings`). El modelo base se inicializa desde Qwen2.5-Omni-3B, reutilizando su tokenizador de texto, encoder de vision, encoder de audio y backbone Thinker compartido con TMRoPE, y elimina el modulo Talker de generacion de voz y la cabeza de modelado de lenguaje, usando el hidden state de la ultima capa en el ultimo token no de padding como embedding de recuperacion.

Es importante senalar que se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, y que los metadatos safetensors publicados reportan una cifra de parametros (5453) inconsistente con un modelo de 3B, por lo que debe tratarse como un artefacto a validar antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal (backbone Qwen2.5-Omni Thinker) con TMRoPE; tokens de texto, vision y audio procesados como secuencia intercalada |
| Parametros totales | 3B nominales (modelo base Ovis-Omni-Embedding-3B, inicializado desde Qwen2.5-Omni-3B). Los metadatos safetensors del repo reportan 5453, cifra no consistente con un modelo de 3B y presumiblemente un artefacto de metadatos |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. La configuracion de prueba documentada en vLLM usa `--max-model-len 512` |
| Tipos de cuantizacion | BitsAndBytes 4-bit NF4 con doble cuantizacion en los pesos del Thinker; torres de audio y vision en BF16 original |
| Idiomas soportados | No disponible (el modelo base deriva de Qwen2.5-Omni, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 5,7 GB); compatible con transformers y con vLLM mediante plugin |
| Dimension de embedding nativa | 2048 |
| Dimension de embedding validada | 1024 (prefijo de las 1024 primeras coordenadas del hidden state, no la proyeccion elastica aprendida del modelo original) |
| Pipeline | feature-extraction |
| Fecha de publicacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura del modelo base parte de Qwen2.5-Omni-3B. En lugar de anadir torres de embedding especificas por modalidad, conserva el tokenizador de texto nativo, el encoder de vision, el encoder de audio y el backbone Thinker compartido. Se eliminan el modulo Talker (generacion de voz) y la cabeza de modelado de lenguaje. La entrada se formatea con una instruccion de recuperacion a traves del procesador y la plantilla de chat nativos, y los tokens de texto, visuales y acusticos se procesan como una unica secuencia intercalada por un Transformer causal compartido. El uso de TMRoPE (time-aligned multimodal rotary position embedding) de Qwen2.5-Omni preserva la alineacion temporal entre audio y video. El embedding de recuperacion es directamente el hidden state de la ultima capa en el ultimo token no de padding, sin cabezas de proyeccion especificas por modalidad.

El entrenamiento descrito en el informe tecnico del modelo original consta de tres etapas: (1) preentrenamiento contrastivo omni-modal con candidatos mezclados globalmente y negativos in-batch cross-device, combinando aprendizaje contrastivo focal sensible a la dificultad con destilacion de la distribucion de similitudes desde expertos de modalidad complementarios; (2) ajuste fino homogeneo de parametros completos sobre datos de alta calidad, formando cada micro-batch a partir de un unico dataset y deduplicando candidatos para evitar colisiones de positivos y falsos negativos in-batch; y (3) destilacion de embeddings con annealing, que retiene ejemplos correctos del profesor, sobremuestrea ejemplos no resueltos del estudiante y aplica supervision forward-KL adaptativa a la confianza para transferir capacidades de expertos sin anadir torres en inferencia. No se detalla el numero de tokens de entrenamiento ni la composicion cuantitativa del dataset en la informacion disponible.

En esta derivada concreta, la innovacion tecnica no esta en el entrenamiento sino en el empaquetado: la cuantizacion 4-bit NF4 con doble cuantizacion reduce el peso del Thinker, mientras que las torres de vision y audio se mantienen en BF16 porque la implementacion multimodal de vLLM espera esas formas de tensor. El artefacto se ha probado con vLLM 0.30.0 y `vllm-bnb-plugin` 0.0.3.

## Capacidades

- Generacion de embeddings multimodales: texto, imagenes, documentos visuales, video y audio, ademas de entradas intercaladas que combinan varias modalidades en una misma secuencia.
- Recuperacion any-to-any: al proyectar todas las modalidades en un unico espacio de representacion, permite busquedas cruzadas (texto a imagen, imagen a texto, audio a video, etc.) con un unico encoder.
- Instrucciones de recuperacion: la entrada se formatea con una retrieval instruction a traves de la plantilla de chat nativa, lo que permite condicionar la representacion segun la tarea.
- Salida de embeddings normalizados de 1024 dimensiones, servibles mediante endpoint compatible con OpenAI (`/v1/embeddings`).
- Soporte de documentos visuales: la modalidad de vision permite indexar y recuperar paginas escaneadas, formularios, facturas o figuras.
- Soporte de video y audio con alineacion temporal mediante TMRoPE.
- Recuperacion agentica sobre herramientas, interfaces y memoria, segun la descripcion del modelo original.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento de multiples pasos; se trata de un modelo de embeddings, no generativo.
- No se declaran capacidades multilingues concretas.

## Casos de uso

- Busqueda multimodal unificada: indexar un corpus heterogeneo con imagenes, audio y video, y consultarlo con texto o con otra modalidad. Un solo encoder evita mantener indices separados por modalidad.
- RAG multimodal: usar los embeddings de 1024 dimensiones como retriever para alimentar un LLM generativo con documentos que contengan figuras, tablas escaneadas o fragmentos de audio.
- Recuperacion de documentos visuales: indexar facturas, formularios y PDF escaneados y recuperarlos por similitud semantica del contenido visual, util en gestion documental y compliance.
- Busqueda en archivos de audio y video: localizar segmentos concretos en grabaciones o videotecas mediante consultas textuales, apoyandose en la alineacion temporal de TMRoPE.
- Sistemas de recomendacion multimodales: generar embeddings de productos a partir de texto e imagen y calcular similitud para recomendacion o busqueda visual en catalogos de comercio electronico.
- Deduplicacion y clustering de contenido: agrupar imagenes, videos o audios casi identicos calculando similitud coseno sobre los embeddings normalizados, por ejemplo para moderacion o limpieza de datasets.
- Memoria y herramientas en agentes: representar estados, observaciones multimodales y descripciones de herramientas en un espacio comun para que un agente recupere acciones o contexto previos.
- Filtrado semantico de contenido: comparar la representacion de una consulta con la de candidatos multimodales para tareas de clasificacion por similitud o deteccion de contenido no deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del derivado cuantizado no incluye metricas de recuperacion (por ejemplo Recall@k, nDCG o MRR) ni comparaciones cuantitativas frente al modelo original en BF16. El unico dato de rendimiento reportado es cualitativo: el artefacto cargo correctamente en una RTX 3080 Laptop de 8 GiB y devolvio embeddings normalizados de 1024 dimensiones.

## Requisitos de hardware

- VRAM estimada: el Thinker cuantizado a 4-bit NF4 reduce el peso del backbone de lenguaje a aproximadamente 2 GB, pero las torres de vision y audio permanecen en BF16, por lo que el consumo agregado de pesos se acerca al tamano del repo (5,7 GB). Se recomienda reservar entre 7 y 9 GB de VRAM para inferencia con vision y audio activos.
- Validacion reportada: carga correcta en una RTX 3080 Laptop con 8 GiB de VRAM.
- GPU consumer compatibles: RTX 3080, 3080 Ti, 3090, 4070 Ti, 4080, 4090 y equivalentes con 8 GB o mas.
- GPU de datacenter o workstation: A10, L4, L40S, A100 y H100, con margen amplio frente al footprint estimado.
- Despliegue con vLLM: requiere vLLM 0.30.0 y `vllm-bnb-plugin` 0.0.3. El comando documentado es `vllm serve . --runner pooling --convert embed --pooler-config '{"dimensions":1024}' --max-model-len 512 --gpu-memory-utilization 0.80`.
- vLLM estandar sin el plugin rechaza `bitsandbytes` como metodo de cuantizacion desconocido, por lo que el plugin es obligatorio.
- Transformers: el modelo se recarga con Transformers y produce embeddings normalizados con forma `[1, 1024]`.
- llama.cpp, Ollama y TGI no estan documentados para este artefacto; el formato de cuantizacion BitsAndBytes 4-bit no es compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Despliegue | Estado |
|---|---|---|---|---|---|---|
| pt810/Ovis-Omni-Embedding-3B-bnb-4bit-vllm | 3B nominales (metadatos safetensors reportan 5453, dato inconsistente) | 4-bit NF4 en el Thinker, BF16 en vision y audio | No disponible (prueba con 512 tokens) | Apache 2.0 | vLLM 0.30.0 + vllm-bnb-plugin 0.0.3, transformers | Derivada cuantizada, 0 descargas y 0 likes |
| ATH-MaaS/Ovis-Omni-Embedding-3B | 3B | BF16 | No disponible en la informacion proporcionada | Apache 2.0 | transformers y despliegue estandar en BF16 | Modelo original del que deriva este artefacto |
| Qwen2.5-Omni-3B | 3B | BF16 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | transformers, vLLM | Modelo base del que se inicializa Ovis-Omni-Embedding-3B; incluye generacion de voz y cabeza de lenguaje |

No se dispone de datos cuantitativos de rendimiento para comparar frente a otros encoders multimodales como CLIP, SigLIP o BGE-M3, por lo que la comparativa se limita a los modelos directamente relacionados con este artefacto.

## Limitaciones y advertencias

- La dimension de embedding validada (1024) es un prefijo de las 1024 primeras coordenadas del hidden state nativo de 2048, no la proyeccion elastica aprendida del modelo original. Esto puede degradar la calidad de recuperacion respecto al checkpoint de referencia.
- No se han publicado evaluaciones de calidad del derivado cuantizado frente al modelo en BF16; se desconoce la perdida de precision introducida por la cuantizacion 4-bit NF4 en tareas de recuperacion.
- El despliegue depende de versiones exactas y concretas del runtime (vLLM 0.30.0 y vllm-bnb-plugin 0.0.3). Versiones distintas pueden fallar.
- vLLM estandar rechaza el metodo de cuantizacion `bitsandbytes` sin el plugin, lo que limita las opciones de despliegue.
- La longitud de contexto no se declara para el modelo base y la configuracion de prueba se limita a 512 tokens, lo que puede ser insuficiente para documentos largos o secuencias de audio y video extensas.
- No se declaran idiomas soportados, por lo que no puede garantizarse un comportamiento multilingue equilibrado.
- Los metadatos safetensors reportan 5453 parametros, una cifra incompatible con un modelo de 3B; conviene verificar la integridad del artefacto antes de usarlo.
- El repositorio no tiene descargas ni likes, de modo que no ha sido validado por la comunidad.
- Riesgo de sesgos y alucinacion: el modelo hereda los sesgos de los datos de entrenamiento de Qwen2.5-Omni y de los corpus de recuperacion usados en las tres etapas de entrenamiento; no se documentan medidas de mitigacion.
- La licencia Apache 2.0 permite uso comercial, pero no se detalla la procedencia ni las restricciones de los datos de entrenamiento subyacentes.
- Al tratarse de una derivada cuantizada, cualquier actualizacion del modelo original requeriria regenerar este artefacto.

## Enlaces

- Repositorio HuggingFace del derivado cuantizado: https://huggingface.co/pt810/Ovis-Omni-Embedding-3B-bnb-4bit-vllm
- Modelo original: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B
- Revision concreta del modelo original usada como fuente: https://huggingface.co/ATH-MaaS/Ovis-Omni-Embedding-3B/tree/926092ea607bdba164c9985a22a2b6130d8b6118
- Repositorio GitHub del proyecto: https://github.com/ATH-MaaS/Ovis-Omni-Embedding
- Informe tecnico (arXiv): https://arxiv.org/pdf/2609.25165
- Documento de cuantizacion incluido en el repo: QUANTIZATION.md (dentro del repositorio de HuggingFace)
- No se encontraron resultados relevantes en la busqueda web realizada; los resultados devueltos no guardaban relacion con el modelo.
