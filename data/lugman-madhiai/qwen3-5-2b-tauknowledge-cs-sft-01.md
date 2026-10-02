# lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-01

## Resumen

Qwen3.5-2B-TauKnowledge-CS-SFT-01 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-2B, publicado por el usuario lugman-madhiai en Hugging Face. Se trata de un modelo denso de 2.274.069.824 parametros (unos 2,27 mil millones) distribuido en formato safetensors, con un repositorio de 4,6 GB, licencia Apache 2.0 y entrenado con la libreria Unsloth junto con TRL de Hugging Face, segun declara el propio autor.

El identificador del checkpoint sugiere una especializacion en conocimiento de ciencias de la computacion, pero la model card publicada no documenta ni el dataset, ni el numero de tokens, ni el procedimiento de entrenamiento, ni hiperparametros. La ficha se limita a indicar el modelo de partida y la herramienta usada para el ajuste, por lo que cualquier afirmacion sobre el corpus de entrenamiento es una inferencia a partir del nombre y no un dato confirmado.

Su interes practico reside en dos factores. Por un lado, la familia Qwen3.5 introduce, segun la documentacion publica de la serie, una base unificada de vision y lenguaje con entrenamiento de fusion temprana sobre billones de tokens multimodales; el pipeline declarado en Hugging Face para este checkpoint es `image-text-to-text`, lo que apunta a un modelo capaz de procesar imagenes y texto. Por otro, se trata de un ajuste de 2,27 B de parametros ejecutable en GPU de consumo, lo que lo hace util para prototipado rapido, despliegue en el borde o tareas de dominio acotado sin infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5 (`qwen3_5`); variante multimodal segun el pipeline declarado (`image-text-to-text`). No se detalla configuracion de capas ni atencion en la informacion disponible |
| Parametros totales | 2.274.069.824 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible para este checkpoint; el modelo hermano Qwen3.5-2B-SearchAgent-SFT-01 figura con 32.768 tokens en featherless.ai, dato no confirmado para este modelo |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors. El tamano del repo (4,6 GB) es coherente con precision BF16 para 2,27 B de parametros |
| Idiomas soportados | en (ingles), segun la etiqueta de idioma de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de este checkpoint. Lo que se puede afirmar con los datos aportados es que se trata de un fine-tuning de Qwen/Qwen3.5-2B, un modelo denso de aproximadamente 2,27 B de parametros perteneciente a la familia Qwen3.5. La etiqueta `qwen3_5` en Hugging Face y el pipeline `image-text-to-text` indican que la familia incorpora capacidades de vision y lenguaje; la documentacion publica de la serie recogida en la busqueda web describe un entrenamiento de fusion temprana sobre billones de tokens multimodales, con paridad cross-generacional frente a Qwen3 en razonamiento, codigo, agentes y comprension visual.

Respecto al entrenamiento de este checkpoint concreto, la unica informacion publicada es que se realizo con Unsloth y la libreria TRL de Hugging Face, con una mejora declarada de velocidad de 2x. No hay datos sobre el numero de tokens de ajuste, la composicion del dataset, el uso de RLHF o DPO, la estrategia de enmascarado de perdida ni si se entreno sobre las torres de vision o unicamente sobre el decodificador de texto. El sufijo "TauKnowledge-CS" del nombre apunta a un corpus orientado a conocimiento de ciencias de la computacion, pero es una inferencia a partir del identificador y no un dato verificado en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con el modo conversacional declarado en las etiquetas del repositorio.
- Procesamiento de entrada mixta imagen-texto, segun el pipeline `image-text-to-text` declarado en Hugging Face; no se especifica el nivel de rendimiento en tareas visuales.
- Razonamiento y generacion de codigo, heredados de la familia Qwen3.5 segun la documentacion publica de la serie; no hay evaluacion especifica publicada para este checkpoint.
- Especializacion probable en conocimiento de ciencias de la computacion, inferida del nombre del modelo y no confirmada por la model card.
- Compatibilidad con text-generation-inference (TGI) y con transformers, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible para este checkpoint; el autor publica modelos hermanos especificamente orientados a agentes de busqueda, pero no hay datos sobre este.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Prototipado de asistentes tecnicos en ingles sobre dominio de informatica: el ajuste apunta a conocimiento de ciencias de la computacion, de modo que puede emplearse para responder consultas sobre programacion, sistemas o algoritmos en un entorno de pruebas con GPU de consumo.
- Generacion y explicacion de fragmentos de codigo en entornos de desarrollo: con 2,27 B de parametros y licencia Apache 2.0, es viable integrarlo en un plugin de editor o en un servicio interno de autocompletado sin coste de licencia.
- Clasificacion y resumen de documentacion tecnica: al ser un modelo pequeno, puede procesar lotes de documentos en una sola GPU para extraer resumenes, etiquetas o pasos de instalacion.
- Despliegue en el borde o en equipos sin GPU dedicada: cuantizado a 4 bits ocupa del orden de 1,5 GB, lo que permite ejecucion en portatiles y mini-PC con llama.cpp u Ollama tras convertir los pesos a GGUF.
- Evaluacion comparativa de ajustes finos: sirve como punto de partida reproducible para estudiar el efecto de un SFT de dominio sobre el modelo base Qwen3.5-2B, dado que el autor publica otros checkpoints derivados del mismo base.
- Generacion aumentada por recuperacion sobre una base de conocimiento interna: el modelo puede actuar como generador final en un pipeline RAG, con el recuperador aportando el contexto factual y el modelo redactando la respuesta.
- Tareas de vision-lenguaje basicas, como descripcion de capturas de pantalla o diagramas tecnicos, si se confirma el funcionamiento de la torre de vision en pruebas reales.
- Ajuste adicional especifico del cliente: al ser un checkpoint pequeno y con licencia permisiva, se puede reentrenar con LoRA sobre datos propios con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K ni evaluaciones multimodales), y los resultados de busqueda encontrados corresponden a un modelo hermano distinto (Qwen3.5-2B-SearchAgent-SFT-01), para el que tampoco se aportan cifras de rendimiento, solo el tamano de parametros y la ventana de contexto.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 4,5-5 GB solo para los pesos (2,27 B x 2 bytes), mas la cache KV y el overhead del runtime; en la practica, entre 6 y 8 GB para contexto moderado.
- VRAM estimada cuantizado a 8 bits: aproximadamente 2,5-3 GB de pesos.
- VRAM estimada cuantizado a 4 bits: aproximadamente 1,5-2 GB de pesos, apto para GPU de 4-6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para BF16 (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070). Para mayor throughput, A100, H100 o L40S en BF16 con vLLM o TGI.
- Compatibilidad con GPU de consumo: si, es un modelo de 2,27 B y cabe holgadamente en tarjetas de gama media; a 4 bits funciona incluso en iGPU con memoria unificada.
- Opciones de despliegue: transformers (formato nativo del repo), text-generation-inference (etiqueta declarada), vLLM, y llama.cpp u Ollama previa conversion a GGUF, ya que el repositorio no publica archivos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-TauKnowledge-CS-SFT-01 | 2.274.069.824 | no disponible | Apache-2.0 | image-text-to-text | Este modelo; ajuste SFT con Unsloth |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | no disponible | no disponible | Modelo de partida declarado; sin ficha tecnica en la informacion aportada |
| Qwen3.5-2B-SearchAgent-SFT-01 | ~2,3 B | 32.768 (segun featherless.ai) | no disponible | no disponible | Modelo hermano del mismo autor, orientado a agentes de busqueda |
| Qwen3.5-2B-SearchAgent-SFT-01-adapter | adaptador de 87,3 MB | no disponible | no disponible | no disponible | Variante en formato adaptador del modelo hermano |

No se dispone de comparativas de rendimiento con alternativas de otros fabricantes (por ejemplo, modelos densos de 1 a 3 B de parametros) en la informacion proporcionada; cualquier tabla de ese tipo requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre datos no especificados, no es posible auditar la composicion del corpus ni los sesgos asociados.
- Riesgo de alucinacion: elevado en un modelo de 2,27 B de parametros, especialmente si el ajuste "TauKnowledge-CS" se realizo sobre un dataset pequeno y no verificado. No se han publicado evaluaciones de fidelidad factual.
- Limitacion de idioma: la model card solo declara ingles. El uso en castellano no esta soportado oficialmente y degradara la calidad de forma previsible.
- Longitud de contexto: no confirmada para este checkpoint. El valor de 32.768 tokens procede de una pagina de terceros referida a un modelo hermano, no a este.
- Uso comercial: la licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales, siempre que se conserve el aviso de licencia y se cumpla con las obligaciones de atribucion.
- Ausencia de validacion externa: el modelo registra 0 descargas y 0 "likes", y la model card es minima (unicamente el modelo base, la licencia y la herramienta de entrenamiento). No hay garantia de calidad, ni informe de evaluacion, ni ejemplos de uso.
- Trazabilidad limitada: no se especifican hiperparametros, semilla, epocas, tasa de aprendizaje ni version del dataset, lo que dificulta reproducir el ajuste.
- Coherencia de metadatos: conviven etiquetas de la familia Qwen3.5 con la libreria `transformers`, el pipeline multimodal y el modelo base; conviene verificar el funcionamiento real de la torre de vision antes de integrarlo en produccion.
- Fechas del repositorio: la creacion y la ultima actualizacion figuran como 2026-10-01, apenas 28 segundos de diferencia entre ambas, lo que sugiere una subida automatizada sin revision posterior.
- En produccion: al carecer de datos de rendimiento y de pruebas de robustez, se recomienda tratarlo como experimental y validar con un conjunto de evaluacion propio antes de exponerlo a usuarios finales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-TauKnowledge-CS-SFT-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo hermano SearchAgent: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Adaptador del modelo hermano: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01-adapter/tree/main
- Pagina de terceros con datos del modelo hermano: https://featherless.ai/models/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Ficha de terceros en LLM Explorer: https://llm-explorer.com/model/lugman-madhiai%2FQwen3.5-2B-SearchAgent-SFT-01,21ViEDEiq86NczoQRxVP9y
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de la serie Qwen3.5 recogida en la busqueda: https://github.com/ABDtmx/Qwen3.5
