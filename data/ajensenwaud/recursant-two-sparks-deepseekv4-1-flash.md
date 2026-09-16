# ajensenwaud/recursant-two-sparks-deepseekv4.1-flash

## Resumen

Recursant Two Sparks — DeepSeek V4.1 Flash es un paquete de pesos redistribuido por el usuario ajensenwaud a partir del modelo multimodal DeepSeek-V4.1-Flash. No se trata de un modelo nuevo ni de una cuantizacion original del autor: el repositorio conserva exactamente el pack retenido que utiliza la receta de serving "matched two-Spark" publicada en su repositorio de GitHub, con los pesos EXL3 de 2 bits para expertos enrutados, los pesos no enrutados en MXFP8, los componentes de vision y los componentes de borrador DSpark configurados con tamano de bloque K=5.

El interes practico del repositorio es la reproducibilidad: identifica las revisiones upstream auditadas (DeepSeek-V4.1-Flash y la distribucion EXL3 de sfxnz) y publica un manifiesto SHA-256 de 53 archivos que permite verificar byte a byte el contenido descargado. El pack completo ocupa 358.128.021.424 bytes (unos 358 GB) repartidos en 48 shards de Safetensors mas configuracion, tokenizer, indice y licencia.

Es relevante ahora porque documenta una ruta concreta para servir un modelo multimodal de gran tamano con expertos enrutados cuantizados a 2 bits sobre un runtime especializado de dos nodos, algo que las herramientas genericas de inferencia no cubren. Las limitaciones son explicitas: no es un checkpoint compatible con `from_pretrained` de Transformers, no es GGUF y no es intercambiable con versiones arbitrarias de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal image-text-to-text; inferida de la referencia a "routed experts" en la model card. Sin detalle de configuracion publicado: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona limites arquitectonicos en `config.json`, pero no los cifra) |
| Tipos de cuantizacion | EXL3 de 2 bits (MCG) en expertos enrutados; MXFP8 en pesos no enrutados (datos E4M3 con escalas UE8M0) |
| Idiomas soportados | no disponible |
| Licencia | MIT (se preserva sin cambios el `LICENSE` original, incluida la nota de copyright de DeepSeek) |
| Formato de pesos | Safetensors (48 shards) mas `config.json`, tokenizer, indice y licencia; 53 archivos, 358.128.021.424 bytes. No es GGUF ni un checkpoint generico de Transformers |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base DeepSeek-V4.1-Flash mas alla de que se trata de un modelo multimodal de tipo image-text-to-text con expertos enrutados, ya que el pack incluye "native EXL3 2-bit MCG routed experts" junto con pesos no enrutados retenidos en MXFP8. El repositorio tambien incorpora los componentes de vision y los componentes de borrador DSpark configurados con tamano de bloque K=5, lo que apunta a decodificacion especulativa dentro del runtime de serving. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en la preservacion de un pack ya cuantizado: los shards grandes de Engram se mantienen intactos y no se realizo resharding ni conversion nueva para la publicacion. La identidad autoritativa de la redistribucion es el manifiesto SHA-256 de 53 archivos en `model-manifest.json`, que excluye el README y el propio manifiesto para evitar un ciclo de auto-hash. Las revisiones upstream auditadas son `dba1be0a40aa45a94ad051997016db3960a90277` (DeepSeek-V4.1-Flash) y `4f93d8d2d5fd86de4be4f28495df587639fa6377` (EXL3 de sfxnz), si bien la model card advierte que dichas revisiones identifican los repositorios inspeccionados durante la auditoria y no garantizan que descargarlas reproduzca cada byte del pack.

## Capacidades

- Generacion de texto y razonamiento: la model card indica que el pack se ha ejercitado con su configuracion de serving de texto y razonamiento.
- Procesamiento multimodal image-text-to-text: el pipeline declarado en HuggingFace es image-text-to-text y el pack incluye explicitamente los componentes de vision.
- Inferencia asistida por borrador: incluye componentes DSpark con tamano de bloque K=5, asociados a decodificacion especulativa en la receta de serving.
- Serving especializado en dos nodos: la receta matched cubre el runtime de dos "Spark" y el manejo de Engram.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue on-premise en dos nodos Spark: el pack esta disenado para la receta de serving matched, que cubre el runtime de dos Spark y el manejo de Engram; es el escenario principal para el que se publico el repositorio.
- Auditoria y reproducibilidad de pesos: gracias al manifiesto SHA-256 de 53 archivos, un equipo puede fijar un commit inmutable y verificar archivo por archivo que la descarga coincide con lo publicado, algo util en entornos con requisitos de cadena de suministro.
- Analisis de documentos con componentes visuales: al ser un modelo image-text-to-text con vision incluida en el pack, puede emplearse para tareas de descripcion o extraccion sobre imagenes dentro de la configuracion de serving validada.
- Investigacion en cuantizacion de expertos enrutados: el uso de EXL3 de 2 bits (MCG) en expertos enrutados frente a MXFP8 en el resto de pesos lo convierte en un objeto de estudio para medir el impacto de la cuantizacion agresiva en modelos MoE multimodales.
- Evaluacion de decodificacion especulativa: los componentes DSpark con K=5 permiten experimentar con tecnicas de borrador dentro del runtime matched y medir su efecto en latencia.
- Replicacion de recetas de serving de gran tamano: equipos que necesiten montar un modelo de unos 358 GB en dos nodos pueden usar este pack y su receta como referencia de configuracion y compatibilidad de runtime.
- Comparacion contra el repositorio EXL3 upstream: sirve para contrastar la configuracion retenida frente a la distribucion EXL3 original de sfxnz sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el pack no ha sido sometido a una evaluacion exhaustiva de calidad, seguridad, longitud de contexto ni portabilidad de hardware.

## Requisitos de hardware

- Huella en disco y memoria: el pack ocupa 358.128.021.424 bytes (unos 358 GB) en 53 archivos. Deducido de ese tamano, se necesita un entorno con al menos esa capacidad de almacenamiento y un reparto de pesos entre nodos para la inferencia.
- GPU consumer: no cabe en una GPU de consumo (por ejemplo, 24 GB), dado que el pack completo es aproximadamente un orden de magnitud mayor.
- GPU de nodo unico: no disponible si cabe en una sola GPU de 80 GB; el pack esta pensado para un runtime de dos nodos.
- Configuracion recomendada: dos nodos "Spark" con la receta de serving matched, que incluye comprobaciones de compatibilidad de runtime.
- Opciones de despliegue: runtime especializado de dos Spark descrito en el repositorio de la receta, con vLLM como etiqueta declarada del modelo. No es compatible con `from_pretrained` de Transformers de forma generica, no es GGUF y no es un checkpoint intercambiable con versiones arbitrarias de vLLM.
- Imagen de contenedor: la publicacion del modelo y la de la imagen de contenedor son puertas de release separadas; esta model card no afirma que exista una imagen publica disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. La presencia de componentes DSpark con K=5 sugiere optimizacion mediante decodificacion especulativa, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ajensenwaud/recursant-two-sparks-deepseekv4.1-flash | no disponible | no disponible | Safetensors, EXL3 2 bits + MXFP8, 53 archivos / 358 GB | MIT | 0 descargas, 0 likes en el momento de la consulta |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | no disponible | no disponible | Safetensors (repositorio upstream) | no disponible en la informacion proporcionada | Repositorio upstream oficial, revision auditada `dba1be0` |
| sfxnz/DeepSeek-V4.1-Flash-EXL3 (upstream EXL3) | no disponible | no disponible | EXL3 | no disponible en la informacion proporcionada | Repositorio upstream, revision auditada `4f93d8d` |

No hay datos de rendimiento publicados para ninguno de los tres, por lo que la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un checkpoint generico: no hay garantia de compatibilidad con `from_pretrained` de Transformers, no es GGUF y no es intercambiable con versiones arbitrarias de vLLM. Requiere la receta de serving matched y sus comprobaciones de compatibilidad.
- Repositorio potencialmente incompleto: la propia model card advierte de que no debe tratarse como completo un repositorio que aun esta recibiendo su subida inicial; deben coincidir los 53 archivos y sus hashes con `model-manifest.json`.
- Ausencia de evaluacion: no se ha realizado una evaluacion exhaustiva de calidad, seguridad, longitud de contexto ni portabilidad de hardware.
- Alucinacion y contenido problematico: la model card reconoce que los modelos pueden alucinar, producir contenido inseguro o sesgado e interpretar mal las imagenes; los resultados deben evaluarse para el uso previsto.
- Limites de contexto: los limites arquitectonicos presentes en `config.json` no garantizan que esos limites quepan en el hardware de referencia.
- Idiomas: no se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Licencias de componentes: la licencia MIT cubre el modelo, pero los componentes de runtime tienen sus propias licencias, que este repositorio no modifica.
- Adopcion nula verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Cifras de rendimiento y requisitos: no se publican datos de latencia, throughput ni de VRAM por GPU, por lo que cualquier planificacion de capacidad debe hacerse por prueba directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajensenwaud/recursant-two-sparks-deepseekv4.1-flash
- Receta de serving two-Spark: https://github.com/ajensenwaud/recursant-two-sparks-deepseekv4.1-flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Distribucion EXL3 upstream: https://huggingface.co/sfxnz/DeepSeek-V4.1-Flash-EXL3
- Manifiesto de verificacion: `model-manifest.json` dentro del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a paginas genericas de YouTube y no guardan relacion con el modelo.
